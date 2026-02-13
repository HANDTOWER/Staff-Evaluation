// Entity model representing AppearanceCriteria
package com.company.appearance.model;

import jakarta.persistence.Embeddable;

/**
 * AppearanceCriteria represents a persistent entity in the application domain.
 */
@Embeddable
public class AppearanceCriteria {

    /**
     * Hat field.
     */
    private boolean hat;
    /**
     * Hair field.
     */
    private boolean hair;
    /**
     * Tie field.
     */
    private boolean tie;
    /**
     * Shirt field.
     */
    private boolean shirt;
    /**
     * Pants field.
     */
    private boolean pants;
    /**
     * Shoes field.
     */
    private boolean shoes;

    /**
     * Constructor for injecting AppearanceCriteria dependencies.
     */
    public AppearanceCriteria() {
    }

    /**
     * Checks whether hat is true.
     * @return boolean result
     */
    public boolean isHat() {
        return hat;
    }

    /**
     * Checks whether hair is true.
     * @return boolean result
     */
    public boolean isHair() {
        return hair;
    }

    /**
     * Checks whether tie is true.
     * @return boolean result
     */
    public boolean isTie() {
        return tie;
    }

    /**
     * Checks whether shirt is true.
     * @return boolean result
     */
    public boolean isShirt() {
        return shirt;
    }

    /**
     * Checks whether pants is true.
     * @return boolean result
     */
    public boolean isPants() {
        return pants;
    }

    /**
     * Checks whether shoes is true.
     * @return boolean result
     */
    public boolean isShoes() {
        return shoes;
    }

    /**
     * Sets the hat.
     * @param hat the hat value
     */
    public void setHat(boolean hat) {
        this.hat = hat;
    }

    /**
     * Sets the hair.
     * @param hair the hair value
     */
    public void setHair(boolean hair) {
        this.hair = hair;
    }

    /**
     * Sets the tie.
     * @param tie the tie value
     */
    public void setTie(boolean tie) {
        this.tie = tie;
    }

    /**
     * Sets the shirt.
     * @param shirt the shirt value
     */
    public void setShirt(boolean shirt) {
        this.shirt = shirt;
    }

    /**
     * Sets the pants.
     * @param pants the pants value
     */
    public void setPants(boolean pants) {
        this.pants = pants;
    }

    /**
     * Sets the shoes.
     * @param shoes the shoes value
     */
    public void setShoes(boolean shoes) {
        this.shoes = shoes;
    }
}
